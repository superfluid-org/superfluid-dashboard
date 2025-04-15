import { ACL_CREATE_PERMISSION, ACL_UPDATE_PERMISSION, ACL_DELETE_PERMISSION } from "./constants";

export const ACL_CREATE_PERMISSION_LABEL = "Create"
export const ACL_UPDATE_PERMISSION_LABEL = "Update"
export const ACL_DELETE_PERMISSION_LABEL = "Delete"

export const flowOperatorPermissionsToString = (permissions: number) => {
  const hasCreatePermission = permissions & ACL_CREATE_PERMISSION;
  const hasUpdatePermission = permissions & ACL_UPDATE_PERMISSION;
  const hasDeletePermission = permissions & ACL_DELETE_PERMISSION;

  const permissionNames = [
    ...(hasCreatePermission ? [ACL_CREATE_PERMISSION_LABEL] : []),
    ...(hasUpdatePermission ? [ACL_UPDATE_PERMISSION_LABEL] : []),
    ...(hasDeletePermission ? [ACL_DELETE_PERMISSION_LABEL] : []),
  ];

  if (!permissionNames.length) {
    return "–";
  }

  return permissionNames.join(", ");
};
