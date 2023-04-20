/* eslint react/jsx-props-no-spreading: "off" */
/* eslint-disable react/require-default-props */
import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import cx from "classnames";
import {
  useFlexLayout,
  useResizeColumns,
  useTable,
  useFilters,
  useSortBy,
  UseTableOptions,
} from "react-table-v7";
import VirtualList from "react-tiny-virtual-list";
import styles from "shared/common/styles/ReactTableV7.scss";

interface Props {
  columns: UseTableOptions<object>["columns"];
  data: UseTableOptions<object>["data"];
  idProp?: string;
  onChangeSelections?: (selections: any[]) => void;
  rowHeight?: number;
}

let wasSelectionPropsWarningShown = false;

function toVisibleSelections(
  selections: Set<any>,
  rows: Record<string, any>[],
  idProp: string
) {
  return rows
    .map((row: Record<string, any>) => row.original[idProp])
    .filter((id) => selections.has(id));
}

const ReactTableV7 = React.forwardRef(
  (
    { columns, data, idProp, onChangeSelections, rowHeight = 24 }: Props,
    ref
  ) => {
    const [selections, setSelections] = useState<Set<any>>(() => new Set());
    const isSelectionEnabled = Boolean(idProp && onChangeSelections);

    if (onChangeSelections && !idProp && !wasSelectionPropsWarningShown) {
      wasSelectionPropsWarningShown = true;

      window.console.warn(
        [
          "An `onChangeSelections` prop has been defined without a ",
          "corresponding `idProp`. Please specify one to enable selection.",
        ].join("")
      );
    }

    const defaultColumn = useMemo(
      () => ({
        minWidth: 50,
        width: 200,
        maxWidth: 500,
        Filter: (filterProps: any) => {
          const { column } = filterProps;
          const { filterValue, setFilter } = column;

          return (
            <input
              className={styles.filter}
              value={filterValue || ""}
              onChange={(e) => {
                setFilter(e.target.value || undefined);
              }}
              onBlur={() => {
                if (idProp && onChangeSelections) {
                  const { filteredRows } = filterProps.columns[0];
                  const visibleSelections = toVisibleSelections(
                    selections,
                    filteredRows,
                    idProp as string
                  );

                  onChangeSelections(visibleSelections);
                }
              }}
            />
          );
        },
      }),
      [idProp, selections, onChangeSelections]
    );

    const {
      getTableProps,
      getTableBodyProps,
      headerGroups,
      rows,
      prepareRow,
      ...rest
    } = useTable(
      {
        columns,
        data,
        defaultColumn,
      },
      useFlexLayout,
      useResizeColumns,
      useFilters,
      useSortBy
    );

    // Undocumented property added by the useFilters plugin.
    const { preFilteredRows } = rest as any;

    const numRowsCheck = rows.reduce((sum, row: Record<string, any>) => {
      if (idProp) {
        return sum + (selections.has(row.original[idProp]) ? 1 : 0);
      }

      return 0;
    }, 0);

    const isSomeRowChecked = numRowsCheck > 0;
    const isEveryRowChecked = isSomeRowChecked && numRowsCheck === rows.length;

    useImperativeHandle(ref, () => ({
      getResolvedState: () => ({
        sortedData: rows.map((row) => row.values),
      }),
    }));

    const headersRef = useRef<HTMLDivElement | null>(null);
    const bodyRef = useRef<HTMLDivElement | null>(null);
    const selectAllRef = useRef<HTMLInputElement | null>(null);
    const listHeight = useRef(400);
    const tableWidth = useRef(0);

    useEffect(() => {
      if (idProp) {
        setSelections((prevSelections) => {
          const nextSelections = new Set();

          preFilteredRows.forEach((row: Record<string, any>) => {
            const idValue = row.original[idProp];
            if (prevSelections.has(idValue)) {
              nextSelections.add(idValue);
            }
          });

          return nextSelections;
        });
      }
    }, [idProp, preFilteredRows]);

    useEffect(() => {
      const onScroll = (e: Event) => {
        headersRef.current
          ?.querySelectorAll("[role='columnheader']")
          .forEach((el: Element) => {
            const { style } = el as HTMLDivElement;
            style.position = "relative";
            style.willChange = "transform";
            style.left = `-${(e.target as HTMLDivElement).scrollLeft}px`;
          });

        bodyRef.current
          ?.querySelectorAll("[data-unscrollable]")
          .forEach((el: Element) => {
            const { style } = el as HTMLDivElement;
            style.position = "relative";
            style.willChange = "transform";
            style.left = `${(e.target as HTMLDivElement).scrollLeft}px`;
          });
      };

      const el = bodyRef.current?.firstChild;
      el?.addEventListener("scroll", onScroll);

      return () => el?.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
      if (selectAllRef.current) {
        (selectAllRef.current as any).indeterminate =
          isSomeRowChecked && !isEveryRowChecked;
      }
    }, [isSomeRowChecked, isEveryRowChecked]);

    useLayoutEffect(() => {
      const max = window.innerHeight - 50;
      const wt = bodyRef.current?.closest(".wide-table");
      const containerHeight =
        wt && wt.parentElement ? wt.parentElement.clientHeight - 95 : Infinity;

      listHeight.current = Math.min(max, containerHeight);
      tableWidth.current = wt ? wt.clientWidth : Infinity;
    }, [rowHeight, rows.length]);

    const handleClickSelectAll = useCallback(() => {
      setSelections((prevSelections: Set<string>) => {
        const nextSelections = new Set(prevSelections);
        const shouldUnselect = isEveryRowChecked;

        rows.forEach((row: Record<string, any>) => {
          const idValue = idProp ? row.original[idProp] : "";

          if (shouldUnselect) {
            nextSelections.delete(idValue);
          } else {
            nextSelections.add(idValue);
          }
        });

        setTimeout(() => {
          if (idProp && onChangeSelections) {
            onChangeSelections(
              toVisibleSelections(nextSelections, rows, idProp as string)
            );
          }
        }, 0);

        return nextSelections;
      });
    }, [rows, idProp, isEveryRowChecked, onChangeSelections]);

    const handleClickCheckbox = useCallback(
      (idValue: string) => {
        setSelections((prevSelections: Set<string>) => {
          const nextSelections = new Set(prevSelections);

          if (nextSelections.has(idValue)) {
            nextSelections.delete(idValue);
          } else {
            nextSelections.add(idValue);
          }

          setTimeout(() => {
            if (idProp && onChangeSelections) {
              onChangeSelections(
                toVisibleSelections(nextSelections, rows, idProp)
              );
            }
          }, 0);

          return nextSelections;
        });
      },
      [rows, idProp, onChangeSelections]
    );

    return (
      <div className={styles.table} {...getTableProps()} role="grid">
        <div ref={headersRef} style={{ maxWidth: tableWidth.current }}>
          <div className={styles.thead}>
            {headerGroups.map((headerGroup) => (
              <div className={styles.tr} {...headerGroup.getHeaderGroupProps()}>
                {isSelectionEnabled && (
                  <label className={cx(styles.td, styles.checkboxContainer)}>
                    <input
                      type="checkbox"
                      checked={isEveryRowChecked}
                      onChange={handleClickSelectAll}
                      ref={selectAllRef}
                    />
                  </label>
                )}
                {headerGroup.headers.map((column: any) => (
                  <div
                    className={styles.th}
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                  >
                    {column.render("Header")}
                    {/* eslint-disable-next-line */}
                    <div
                      {...column.getResizerProps()}
                      className={cx(styles.resizer, {
                        [styles.isResizing]: column.isResizing,
                      })}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className={styles.thead}>
            {headerGroups.map((headerGroup) => (
              <div className={styles.tr} {...headerGroup.getHeaderGroupProps()}>
                {isSelectionEnabled && (
                  <div className={styles.selectionSpacer} />
                )}
                {headerGroup.headers.map((column: any) => (
                  <div className={styles.th} {...column.getHeaderProps()}>
                    {column.canFilter ? column.render("Filter") : null}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className={styles.tbody} {...getTableBodyProps()} ref={bodyRef}>
          <VirtualList
            className={styles.virtualList}
            style={{ display: rows.length > 0 ? "block" : "none" }}
            height={listHeight.current}
            itemSize={rowHeight}
            itemCount={rows.length}
            renderItem={({ index, style }: any) => {
              const row: Record<string, any> = rows[index];
              prepareRow(row as any);
              const rowProps = row.getRowProps();
              const idValue = idProp ? row.original[idProp] : "";

              return (
                <div key={rowProps.key} style={style}>
                  {/* eslint-disable-next-line */}
                  <div
                    role="row"
                    className={styles.tr}
                    {...rowProps}
                    onClick={(e: any) => {
                      if (e.target.role === "cell") {
                        handleClickCheckbox(idValue);
                      }
                    }}
                  >
                    {isSelectionEnabled && (
                      <label
                        className={cx(styles.td, styles.checkboxContainer)}
                        data-unscrollable
                      >
                        <input
                          type="checkbox"
                          checked={selections.has(idValue)}
                          onChange={() => handleClickCheckbox(idValue)}
                        />
                      </label>
                    )}
                    {row.cells.map((cell: any) => (
                      <div className={styles.td} {...cell.getCellProps()}>
                        <div className={styles.tdContent}>
                          {cell.render("Cell")}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }}
          />
          {rows.length === 0 && (
            <div
              className={styles.noRowsFound}
              style={{ height: listHeight.current }}
            >
              No rows found
            </div>
          )}
        </div>
      </div>
    );
  }
);

export default ReactTableV7;