import React from 'react';

interface TemplateProps {
  children: React.ReactNode;
}
/**
 * A template file is similar to a layout in that it wraps each child layout or page. 
 * Unlike layouts that persist across routes and maintain state, 
 * templates create a new instance for each of their children on navigation.
 */
const Template: React.FC<TemplateProps> = ({ children }) => {
  return <div className="h-screen p-6 flex justify-center ">{children}</div>;
};

export default Template;
