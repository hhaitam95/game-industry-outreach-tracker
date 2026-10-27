/** Maximum serialized private-workspace payload accepted by schema and encryption. */
export const MAX_WORKSPACE_SERIALIZED_BYTES = 32 * 1024 * 1024;

/** Maximum serialized encrypted envelope, including base64 expansion and metadata. */
export const MAX_ENCRYPTED_BACKUP_BYTES = 48 * 1024 * 1024;
