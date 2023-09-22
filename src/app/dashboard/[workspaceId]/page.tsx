import React from 'react';

const Workspace = ({ params }: { params: { workspaceId: string } }) => {
  console.group();
  return <div>{params.workspaceId}Workspace</div>;
};

export default Workspace;
