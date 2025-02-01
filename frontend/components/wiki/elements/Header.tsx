import { FC } from 'react';

interface HeaderProps {
  children: React.ReactNode;
}

export const Header: FC<HeaderProps> = ({ children }) => {
  return (
    <h1 className="text-4xl font-bold mb-6 text-default-900">
      {children}
    </h1>
  );
};