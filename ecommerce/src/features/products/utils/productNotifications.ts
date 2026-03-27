import { notifyInfo } from '@/shared/lib/toast';

export function notifyProductSelected(productTitle: string) {
  notifyInfo(`${productTitle} selected`);
}
