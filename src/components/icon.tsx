import dynamic from 'next/dynamic';
import { LucideProps } from 'lucide-react';
import dynamicIconImports from 'lucide-react/dynamicIconImports';
import { memo } from 'react';

interface IconProps extends LucideProps {
  name: keyof typeof dynamicIconImports;
}
console.log('INVOKED');

function someComponent({ name, ...props }: IconProps) {
  const LucideIcon = dynamic(dynamicIconImports[name], {
    loading: () => <div className="bg-muted rounded-sm"></div>,
  });

  return <LucideIcon {...props} />;
}

const Icon = memo(someComponent);

export default Icon;
