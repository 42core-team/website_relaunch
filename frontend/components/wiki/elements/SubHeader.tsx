import { FC } from 'react';

interface SubHeaderProps {
  children: React.ReactNode;
}

export const SubHeader: FC<SubHeaderProps> = ({ children }) => {
  return (
    <h2 className="text-2xl font-semibold mb-4 mt-8 text-default-800">
      {children}
    </h2>
  );
};