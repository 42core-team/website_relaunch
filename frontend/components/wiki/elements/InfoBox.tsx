import { FC } from 'react';

interface InfoBoxProps {
  title?: string;
  children: React.ReactNode;
}

    export const InfoBox: FC<InfoBoxProps> = ({ title, children }) => {
  return (
    <div className="bg-warning-100 dark:bg-warning-900/20 border-l-4 border-warning-500 p-4 mb-4 rounded">
      {title && <h4 className="font-bold mb-2">{title}</h4>}
      <div className="text-default-600">{children}</div>
    </div>
  );
};