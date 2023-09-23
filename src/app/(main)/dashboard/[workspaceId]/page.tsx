import React from 'react';

const Workspace = ({ params }: { params: { workspaceId: string } }) => {
  return <div>{params.workspaceId}Workspace</div>;
};

export default Workspace;
