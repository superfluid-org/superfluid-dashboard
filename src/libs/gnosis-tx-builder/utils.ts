import { encodePacked, keccak256 } from "viem";

import { BatchFile } from "./types";

export const stringifyReplacer = (_: string, value: any) => (value === undefined ? null : value);

export const serializeJSONObject = (json: any): string => {
  if (Array.isArray(json)) {
    return `[${json.map((el) => serializeJSONObject(el)).join(",")}]`;
  }

  if (typeof json === "object" && json !== null) {
    let acc = "";
    const keys = Object.keys(json).sort();
    acc += `{${JSON.stringify(keys, stringifyReplacer)}`;

    for (let i = 0; i < keys.length; i++) {
      acc += `${serializeJSONObject(json[keys[i]])},`;
    }

    return `${acc}}`;
  }

  return `${JSON.stringify(json, stringifyReplacer)}`;
};

export const calculateChecksum = (batchFile: BatchFile): string | undefined => {
  const batchFileMeta = { ...batchFile.meta };
  delete batchFileMeta.checksum;
  const serialized = serializeJSONObject({
    ...batchFile,
    meta: { ...batchFileMeta, name: null },
  });
  const sha = keccak256(encodePacked(["string"], [serialized]));

  return sha || undefined;
};

export const addChecksum = (batchFile: BatchFile): BatchFile => {
  return {
    ...batchFile,
    meta: {
      ...batchFile.meta,
      checksum: calculateChecksum(batchFile),
    },
  };
};
