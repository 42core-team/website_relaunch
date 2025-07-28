import { redirect } from 'next/navigation';

export default function WikiRoot() {
  redirect('/wiki/README');
}
