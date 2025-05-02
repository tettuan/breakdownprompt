/**
 * Permission-related error messages
 *
 * This enum provides standardized error messages for different types of permission denials.
 * Each message clearly indicates the type of operation that was denied and the target resource.
 */
export enum PermissionErrorMessages {
  /** Error message when read permission is denied for a file */
  READ_FILE = "Read permission denied: Cannot read file",

  /** Error message when write permission is denied for a file */
  WRITE_FILE = "Write permission denied: Cannot write to file",

  /** Error message when execute permission is denied for a file */
  EXECUTE_FILE = "Execute permission denied: Cannot execute file",

  /** Error message when read permission is denied for a template file */
  READ_TEMPLATE = "Read permission denied: Cannot read template file",

  /** Error message when write permission is denied for a template file */
  WRITE_TEMPLATE = "Write permission denied: Cannot write template file",

  /** Error message when access permission is denied for a file */
  ACCESS_FILE = "Access permission denied: Cannot access file",

  /** Error message when directory access permission is denied */
  ACCESS_DIRECTORY = "Access permission denied: Cannot access directory",
}
