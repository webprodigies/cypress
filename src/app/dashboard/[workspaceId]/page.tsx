import React from 'react';

const Workspace = ({ params }: { params: { workspaceId: string } }) => {
  return <div className="overflow-scroll h-screen">{params.workspaceId}</div>;
};

export default Workspace;
