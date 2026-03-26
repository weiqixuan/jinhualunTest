import { Tag } from "antd";
import { ProductStatus } from "../domain/product";

interface StatusBadgeProps {
  status: ProductStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Tag variant="filled" className={`status-tag status-tag--${status}`}>
      {status}
    </Tag>
  );
}
