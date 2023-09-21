import React from 'react';

const File = ({ params }: { params: { fileId: string } }) => {
  return <div>Viewing File {params.fileId}</div>;
};

export default File;
