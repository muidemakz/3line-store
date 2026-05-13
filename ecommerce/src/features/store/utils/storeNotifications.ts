import { notifyInfo } from '@/shared/lib/toast';

export function notifyProductSelected(title: string) {
  notifyInfo(`Selected: ${title}`);
}
