import { IconProps } from "phosphor-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";

interface SmallInfoCardProps {
  icon: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;
  title: string;
  value: string | number | Date;
  backgroundWhite?: boolean;
  width?: string | number;
}

const SmallInfoCard: React.FC<SmallInfoCardProps> = ({
  icon: Icon,
  title,
  value,
  backgroundWhite,
  width,
}) => {
  return (
    <div
      className={
        backgroundWhite
          ? `flex items-start p-4 rounded-xl shadow-sm border border-stroke bg-background w-${width}`
          : `flex items-center p-4 rounded-xl shadow-sm border border-stroke bg-foreground w-${width}`
      }
    >
      <div className="flex w-full flex-col gap-3 ">
        <h3
          className={
            backgroundWhite
              ? "text-sm text-secondaryText border-b border-stroke pb-2"
              : "text-sm text-primary border-b border-darkerStroke pb-2"
          }
        >
          {title}
        </h3>
        <div className="flex flex-row gap-2 ">
          <Icon size={24} weight="regular" className="text-primaryText" />
          <p className="text-md text-primaryText">
            {value instanceof Date ? value.toLocaleDateString() : value}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SmallInfoCard;
