import React, {
  Children,
  isValidElement,
  cloneElement,
  useEffect,
  useState,
} from "react";
import styles from "../../styles/FilterControls.scss";

interface Props {
  defaultIndex?: number;
  disabled?: boolean;
  children: React.ReactNode;
}

function FilterAccordions({ defaultIndex, disabled, children }: Props) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(
    disabled ? null : defaultIndex
  );

  useEffect(() => {
    if (!disabled) {
      setExpandedIndex((index) => (index === null ? defaultIndex : index));
    }
  }, [disabled, defaultIndex]);

  const handleClickExpand = (index: number) => {
    setExpandedIndex(index === expandedIndex ? null : index);
  };

  return (
    <div className={styles.FilterAccordions}>
      {Children.map(children, (child, index) =>
        isValidElement(child)
          ? cloneElement(child, {
              disabled,
              expanded: index === expandedIndex,
              onClickExpand: () => handleClickExpand(index),
            })
          : null
      )}
    </div>
  );
}

FilterAccordions.defaultProps = {
  disabled: false,
  defaultIndex: null,
};

export default FilterAccordions;
