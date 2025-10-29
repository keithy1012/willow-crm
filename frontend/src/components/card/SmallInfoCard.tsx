import { IconProps } from "phosphor-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";

interface SmallInfoCardProps {
  icon: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;
  title: string;
  value: string | number | Date;
  backgroundWhite?: boolean;
}

const SmallInfoCard: React.FC<SmallInfoCardProps> = ({
  icon: Icon,
  title,
  value,
  backgroundWhite,
}) => {
  return (
    <div
      className={
        backgroundWhite
          ? "flex items-start p-4 rounded-xl shadow-sm border border-stroke bg-background"
          : "flex items-center p-4 rounded-xl shadow-sm border border-stroke bg-foreground"
      }
    >
      <div className="flex w-full flex-col gap-3 ">
        <h3
          className={
            backgroundWhite
              ? "text-sm text-secondaryText border-b border-stroke pb-2"
              : "text-sm text-primary"
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
