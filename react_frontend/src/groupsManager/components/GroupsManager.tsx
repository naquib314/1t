import "src/public-path";
import * as React from "react";
import ApiContext from "shared/common/utilities/ApiContext";
import { useCallback, useContext, useEffect, useState } from "react";
import { GroupArgs, GroupEntryArgs } from "shared/common/models/Group";

import GroupsPage from "shared/groupsManager/components/GroupsPage";

export default function GroupsManager() {
  const context = useContext(ApiContext);
  const [dapi] = useState(() => context.getApi());

  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const currentUser = await dapi.getBreadboxUser();
      setUser(currentUser);
    })();
  }, [dapi]);

  const getGroups = useCallback(() => dapi.getGroups(), [dapi]);
  const postGroup = useCallback(
    (groupArgs: GroupArgs) => dapi.postGroup(groupArgs),
    [dapi]
  );
  const deleteGroup = useCallback((id: string) => dapi.deleteGroup(id), [dapi]);
  const postGroupEntry = useCallback(
    (groupId: string, groupEntryArgs: GroupEntryArgs) =>
      dapi.postGroupEntry(groupId, groupEntryArgs),
    [dapi]
  );
  const deleteGroupEntry = useCallback(
    (groupEntryId: string) => dapi.deleteGroupEntry(groupEntryId),
    [dapi]
  );

  return (
    <div>
      {user && (
        <GroupsPage
          user={user}
          getGroups={getGroups}
          addGroup={postGroup}
          deleteGroup={deleteGroup}
          addGroupEntry={postGroupEntry}
          deleteGroupEntry={deleteGroupEntry}
        />
      )}
    </div>
  );
}
