import Editor from '@/components/editor/editor';
import React from 'react';

const Workspace = ({ params }: { params: { workspaceId: string } }) => {
  return (
    <div>
      <Editor></Editor>
    </div>
  );
};

export default Workspace;
