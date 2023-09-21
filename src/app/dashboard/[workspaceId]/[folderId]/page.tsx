import React from 'react';

const Folder = ({ params }: { params: { folderId: string } }) => {
  return <div>Viewing Folder{params.folderId}</div>;
};

export default Folder;
