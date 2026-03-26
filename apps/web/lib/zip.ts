const textEncoder = new TextEncoder();

let crcTable: Uint32Array | null = null;

function getCrcTable(): Uint32Array {
  if (crcTable) {
    return crcTable;
  }

  crcTable = new Uint32Array(256);
  for (let index = 0; index < 256; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) {
      value = (value & 1) === 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    crcTable[index] = value >>> 0;
  }

  return crcTable;
}

function crc32(bytes: Uint8Array): number {
  const table = getCrcTable();
  let crc = 0xffffffff;

  for (const byte of bytes) {
    crc = table[(crc ^ byte) & 0xff]! ^ (crc >>> 8);
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function writeUint16(view: DataView, offset: number, value: number): void {
  view.setUint16(offset, value, true);
}

function writeUint32(view: DataView, offset: number, value: number): void {
  view.setUint32(offset, value >>> 0, true);
}

function toDosDateTime(date: Date): { dosDate: number; dosTime: number } {
  const year = Math.max(1980, date.getFullYear());
  const dosDate = ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  const dosTime = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  return { dosDate, dosTime };
}

function concatLengths(parts: Uint8Array[]): number {
  return parts.reduce((total, part) => total + part.length, 0);
}

function toBlobPart(bytes: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return buffer;
}

function createLocalHeader(
  pathBytes: Uint8Array,
  dataBytes: Uint8Array,
  checksum: number,
  dosDate: number,
  dosTime: number
): Uint8Array {
  const header = new Uint8Array(30 + pathBytes.length);
  const view = new DataView(header.buffer);
  writeUint32(view, 0, 0x04034b50);
  writeUint16(view, 4, 20);
  writeUint16(view, 6, 0x0800);
  writeUint16(view, 8, 0);
  writeUint16(view, 10, dosTime);
  writeUint16(view, 12, dosDate);
  writeUint32(view, 14, checksum);
  writeUint32(view, 18, dataBytes.length);
  writeUint32(view, 22, dataBytes.length);
  writeUint16(view, 26, pathBytes.length);
  writeUint16(view, 28, 0);
  header.set(pathBytes, 30);
  return header;
}

function createCentralHeader(
  pathBytes: Uint8Array,
  dataBytes: Uint8Array,
  checksum: number,
  dosDate: number,
  dosTime: number,
  localHeaderOffset: number
): Uint8Array {
  const header = new Uint8Array(46 + pathBytes.length);
  const view = new DataView(header.buffer);
  writeUint32(view, 0, 0x02014b50);
  writeUint16(view, 4, 20);
  writeUint16(view, 6, 20);
  writeUint16(view, 8, 0x0800);
  writeUint16(view, 10, 0);
  writeUint16(view, 12, dosTime);
  writeUint16(view, 14, dosDate);
  writeUint32(view, 16, checksum);
  writeUint32(view, 20, dataBytes.length);
  writeUint32(view, 24, dataBytes.length);
  writeUint16(view, 28, pathBytes.length);
  writeUint16(view, 30, 0);
  writeUint16(view, 32, 0);
  writeUint16(view, 34, 0);
  writeUint16(view, 36, 0);
  writeUint32(view, 38, 0);
  writeUint32(view, 42, localHeaderOffset);
  header.set(pathBytes, 46);
  return header;
}

function createEndRecord(fileCount: number, centralDirectorySize: number, centralDirectoryOffset: number): Uint8Array {
  const record = new Uint8Array(22);
  const view = new DataView(record.buffer);
  writeUint32(view, 0, 0x06054b50);
  writeUint16(view, 4, 0);
  writeUint16(view, 6, 0);
  writeUint16(view, 8, fileCount);
  writeUint16(view, 10, fileCount);
  writeUint32(view, 12, centralDirectorySize);
  writeUint32(view, 16, centralDirectoryOffset);
  writeUint16(view, 20, 0);
  return record;
}

export interface ZipEntry {
  path: string;
  content: string;
}

export function createZipArchive(entries: ZipEntry[]): Blob {
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;
  const { dosDate, dosTime } = toDosDateTime(new Date());

  entries.forEach((entry) => {
    const pathBytes = textEncoder.encode(entry.path);
    const dataBytes = textEncoder.encode(entry.content);
    const checksum = crc32(dataBytes);
    const localHeader = createLocalHeader(pathBytes, dataBytes, checksum, dosDate, dosTime);
    localParts.push(localHeader, dataBytes);

    const centralHeader = createCentralHeader(pathBytes, dataBytes, checksum, dosDate, dosTime, offset);
    centralParts.push(centralHeader);

    offset += localHeader.length + dataBytes.length;
  });

  const centralDirectoryOffset = offset;
  const centralDirectorySize = concatLengths(centralParts);
  const endRecord = createEndRecord(entries.length, centralDirectorySize, centralDirectoryOffset);

  return new Blob(
    [...localParts, ...centralParts, endRecord].map((part) => toBlobPart(part)),
    { type: "application/zip" }
  );
}

export function downloadBlob(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
