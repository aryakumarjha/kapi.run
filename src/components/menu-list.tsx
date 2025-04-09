import { SimplifiedMenuItem } from "@/types/menu";

interface MenuListProps {
  menu: SimplifiedMenuItem[];
}

export default function MenuList(props: MenuListProps) {
  return (
    <ul>
      {props.menu.map((item) => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}
