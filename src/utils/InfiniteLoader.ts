import React, { PureComponent } from 'react';

type Ranges = Array<number>;

function isInteger(value: number): boolean {
  return (
    typeof value === 'number' && isFinite(value) && Math.floor(value) === value
  );
}

function isRangeVisible({
  lastRenderedStartIndex,
  lastRenderedStopIndex,
  startIndex,
  stopIndex,
}: {
  lastRenderedStartIndex: number,
  lastRenderedStopIndex: number,
  startIndex: number,
  stopIndex: number,
}): boolean {
  return !(
    startIndex > lastRenderedStopIndex || stopIndex < lastRenderedStartIndex
)};

function scanForUnloadedRanges({
  isItemLoaded,
  itemCount,
  minimumBatchSize,
  startIndex,
  stopIndex,
}: {
  isItemLoaded: (index: number) => boolean,
  itemCount: number,
  minimumBatchSize: number,
  startIndex: number,
  stopIndex: number,
}): Ranges {
  const unloadedRanges: Ranges = [];

  let rangeStartIndex = 0;
  let rangeStopIndex = 0;

  for (let index = startIndex; index <= stopIndex; index++) {
    let loaded = isItemLoaded(index);

    if (!loaded) {
      rangeStopIndex = index;
      if (rangeStartIndex === null) {
        rangeStartIndex = index;
      }
    } else if (rangeStopIndex !== null) {
      unloadedRanges.push(
        rangeStartIndex,
        rangeStopIndex
      );

      rangeStartIndex = rangeStopIndex = 0;
    }
  }

  // If :rangeStopIndex is not null it means we haven't ran out of unloaded rows.
  // Scan forward to try filling our :minimumBatchSize.
  if (rangeStopIndex !== null) {
    const potentialStopIndex = Math.min(
      Math.max(rangeStopIndex, rangeStartIndex + minimumBatchSize - 1),
      itemCount - 1
    );

    for (let index = rangeStopIndex + 1; index <= potentialStopIndex; index++) {
      if (!isItemLoaded(index)) {
        rangeStopIndex = index;
      } else {
        break;
      }
    }

    unloadedRanges.push(
      rangeStartIndex,
      rangeStopIndex

    );
  }

  // Check to see if our first range ended prematurely.
  // In this case we should scan backwards to try filling our :minimumBatchSize.
  if (unloadedRanges.length) {
    while (
      unloadedRanges[1] - unloadedRanges[0] + 1 < minimumBatchSize &&
      unloadedRanges[0] > 0
    ) {
      let index = unloadedRanges[0] - 1;

      if (!isItemLoaded(index)) {
        unloadedRanges[0] = index;
      } else {
        break;
      }
    }
  }

  return unloadedRanges;
}



type onItemsRenderedParams = {
  visibleStartIndex: number,
  visibleStopIndex: number,
};
type onItemsRendered = (params: onItemsRenderedParams) => void;
type setRef = (ref: any) => void;

/*
export type Props = {|
  // Render prop.
  children: ({ onItemsRendered: onItemsRendered, ref: setRef }) => React$Node,

  // Function responsible for tracking the loaded state of each item.
  isItemLoaded: (index: number) => boolean,

  // Number of rows in list; can be arbitrary high number if actual number is unknown.
  itemCount: number,

  // Callback to be invoked when more rows must be loaded.
  // It should return a Promise that is resolved once all data has finished loading.
  loadMoreItems: (startIndex: number, stopIndex: number) => Promise<void>,

  // Renamed to loadMoreItems in v1.0.3; will be removed in v2.0
  loadMoreRows?: (startIndex: number, stopIndex: number) => Promise<void>,

  // Minimum number of rows to be loaded at a time; defaults to 10.
  // This property can be used to batch requests to reduce HTTP requests.
  minimumBatchSize?: number,

  // Threshold at which to pre-fetch data; defaults to 15.
  // A threshold of 15 means that data will start loading when a user scrolls within 15 rows.
  threshold?: number,
|};
*/
export default class InfiniteLoader extends PureComponent {
  _lastRenderedStartIndex: number = -1;
  _lastRenderedStopIndex: number = -1;
  _listRef: any;
  _memoizedUnloadedRanges: Ranges = [];

  resetloadMoreItemsCache(autoReload: boolean = false) {
    this._memoizedUnloadedRanges = [];

    if (autoReload) {
      this._ensureRowsLoaded(
        this._lastRenderedStartIndex,
        this._lastRenderedStopIndex
      );
    }
  }

  componentDidMount() {
    if (process.env.NODE_ENV !== 'production') {
      if (this._listRef == null) {
        console.warn(
          'Invalid list ref; please refer to InfiniteLoader documentation.'
        );
      }
    }
  }

  render() {
    const { children } = this.props;

    return children({
      onItemsRendered: this._onItemsRendered,
      ref: this._setRef,
    });
  }

  _onItemsRendered: onItemsRendered = ({
    visibleStartIndex,
    visibleStopIndex,
  }: onItemsRenderedParams) => {


    if (process.env.NODE_ENV !== 'production') {
      if (!isInteger(visibleStartIndex) || !isInteger(visibleStopIndex)) {
        console.warn(
          'Invalid onItemsRendered signature; please refer to InfiniteLoader documentation.'
        );
      }

      if (typeof this.props.loadMoreRows === 'function') {
        console.warn(
          'InfiniteLoader "loadMoreRows" prop has been renamed to "loadMoreItems".'
        );
      }
    }

    this._lastRenderedStartIndex = visibleStartIndex;
    this._lastRenderedStopIndex = visibleStopIndex;

    this._ensureRowsLoaded(visibleStartIndex, visibleStopIndex);
  };

  _setRef: setRef = (listRef: any) => {
    this._listRef = listRef;
  };

  _ensureRowsLoaded(startIndex: number, stopIndex: number) {
    const {
      isItemLoaded,
      itemCount,
      minimumBatchSize = 10,
      threshold = 15,
    } = this.props;

    const unloadedRanges = scanForUnloadedRanges({
      isItemLoaded,
      itemCount,
      minimumBatchSize,
      startIndex: Math.max(0, startIndex - threshold),
      stopIndex: Math.min(itemCount - 1, stopIndex + threshold),
    });


    // Avoid calling load-rows unless range has changed.
    // This shouldn't be strictly necessary, but is maybe nice to do.
    if (
      this._memoizedUnloadedRanges.length !== unloadedRanges.length ||
      this._memoizedUnloadedRanges.some(
        (startOrStop, index) => unloadedRanges[index] !== startOrStop
      )
    ) {
      this._memoizedUnloadedRanges = unloadedRanges;
      this._loadUnloadedRanges(unloadedRanges);
    }
  }

  _loadUnloadedRanges(unloadedRanges: Ranges) {
    // loadMoreRows was renamed to loadMoreItems in v1.0.3; will be removed in v2.0
    const loadMoreItems = this.props.loadMoreItems || this.props.loadMoreRows;

    for (let i = 0; i < unloadedRanges.length; i += 2) {
      const startIndex = unloadedRanges[i];
      const stopIndex = unloadedRanges[i + 1];
      const promise = loadMoreItems(startIndex, stopIndex);

      if (promise != null) {
        promise.then(() => {
          // Refresh the visible rows if any of them have just been loaded.
          // Otherwise they will remain in their unloaded visual state.
          if (
            isRangeVisible({
              lastRenderedStartIndex: this._lastRenderedStartIndex,
              lastRenderedStopIndex: this._lastRenderedStopIndex,
              startIndex,
              stopIndex,
            })
          ) {
            // Handle an unmount while promises are still in flight.
            if (this._listRef == null) {
              return;
            }

            // Resize cached row sizes for VariableSizeList,
            // otherwise just re-render the list.
            if (typeof this._listRef.resetAfterIndex === 'function') {
              this._listRef.resetAfterIndex(startIndex, true);
            } else {
              // HACK reset temporarily cached item styles to force PureComponent to re-render.
              // This is pretty gross, but I'm okay with it for now.
              // Don't judge me.
              if (typeof this._listRef._getItemStyleCache === 'function') {
                this._listRef._getItemStyleCache(-1);
              }
              this._listRef.forceUpdate();
            }
          }
        });
      }
    }
  }
}