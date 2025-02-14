import React, { useState, useEffect, useRef, PureComponent } from 'react';
import InfiniteLoader from "../utils/InfiniteLoader.ts"; //'react-window-infinite-loader';
import { FixedSizeList } from 'react-window';


import Retriever from "../utils/Retriever";
import './ThumbnailView.css';

//******************************************************************************
//**  Thumbnails View
//******************************************************************************
/**
 *   Used to fetch media items and folders from the server and render
 *   thumbnails.
 *
 ******************************************************************************/

let retriever = new Retriever();
let renderedRows = new Set();

let items = [];
let hasMore = true;



const config = {
    size: 300 //image size
};

const ITEM_WIDTH = 320;
const ITEM_HEIGHT = 320;


export const ThumbnailView = ({filter, setFilter}) => {
console.log("reset!");


    const infiniteListRef = useRef(null);
    if (infiniteListRef.current) infiniteListRef.current.refresh();


    renderedRows.clear();
    items = [];
    hasMore = true;
    retriever.setFilter(filter);


    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);



  //Watch for render and resize events on the main div (see render below)
    const divRef = useRef(null);
    useEffect(() => {
        const div = divRef.current;
        setWidth(div.offsetWidth);
        setHeight(div.offsetHeight);
        //console.log(div.offsetWidth, div.offsetHeight);

        window.addEventListener("resize", ()=>{
            setWidth(div.offsetWidth);
            setHeight(div.offsetHeight);
            //console.log(div.offsetWidth, div.offsetHeight);
        });
    }, []);


  //**************************************************************************
  //** updateFilter
  //**************************************************************************
    function updateFilter(){
        setFilter(JSON.parse(JSON.stringify(filter)));
    };


  //**************************************************************************
  //** Folder
  //**************************************************************************
    function Folder({item}){
        return (
            <div
                key={item.id} className="thumbnail"
                onClick={()=>{
                    if (!filter.path) filter.path = [];
                    filter.path.push(item.name);
                    updateFilter();
                }}
            >
                <div className="folder-icon"></div>
                <div>{item.name}</div>
            </div>
        )
    };


  //**************************************************************************
  //** Thumbnail
  //**************************************************************************
    function Thumbnail({item}){
        var path = "image?width=" + config.size + "&id=";
        var url = path + item.id;

        return (

            <div
                key={item.id} className="thumbnail" style={{backgroundImage: "none"}}
                onClick={()=>{
                    console.log(item);
                }}
            >
                <img style={{display:"none"}}
                    onLoad={(e)=>{
                        var img = e.target;
                        var thumbnail = img.parentNode;
                        thumbnail.style.backgroundImage = "url(\"" +  img.src + "\")";
                        //thumbnail.removeChild(img);
                    }}
                    onError={(e)=>{
                        var img = e.target;
                        var thumbnail = img.parentNode;
                        thumbnail.className += " not-available";
                        //thumbnail.removeChild(img);
                    }}
                    src={url}
                ></img>
            </div>
        )
    };


  //**************************************************************************
  //** NoResults
  //**************************************************************************
    function NoResults(){
        return (
            <div className="no-search-results middle noselect">
                <div className="icon"/>
                <div>No images found</div>
            </div>
        );
    };



  //**************************************************************************
  //** render
  //**************************************************************************
    return (

        <div ref={divRef} className='thumbnail-view' style={{
            position:"relative", overflow:"hidden", width: "100%", height: "100%"
        }}>
            <div style={{position:"absolute", width: "100%"}}>

                <InfiniteList
                    ref={infiniteListRef}
                    width={width}
                    height={height}

                    itemRenderer={(item)=>{
                        if (item.isFolder){
                            return <Folder key={item.id} item={item}/>
                        }
                        else{
                            return <Thumbnail key={item.id} item={item}/>
                        }
                    }}

                    noItemsRenderer={()=>{
                        return <NoResults />
                    }}
                />

            </div>
        </div>

    );
}



//******************************************************************************
//**  InfiniteList
//******************************************************************************
/**
 *   Used to fetch media items and folders from the server and render
 *   thumbnails.
 *
 ******************************************************************************/

class InfiniteList extends PureComponent {

  //Set initial state
    state = {
        hasNextPage: true,
        isNextPageLoading: false,
        numRequests: 0,
        items: []
    };


  //**************************************************************************
  //** constructor
  //**************************************************************************
    constructor(props) {
        super(props);

      //Create reference for the InfiniteLoader in the wrapper
        this.infiniteLoaderRef = React.createRef();
    }


  //**************************************************************************
  //** loadNextPage
  //**************************************************************************
    _loadNextPage = (startIndex, stopIndex) => {
        //console.log("loadNextPage", startIndex, stopIndex);


        this.setState({ isNextPageLoading: true }, () => {

            var wasEOF = retriever.isEOF();

            retriever.fetch((data)=>{

                var numRequests = this.state.numRequests;
                if (!wasEOF) numRequests++;

                this.setState(state => ({
                    hasNextPage: !retriever.isEOF(),
                    isNextPageLoading: false,
                    numRequests: numRequests,
                    items: data.length>0 ? [...state.items].concat(data) : state.items
                }));

            });

        });
    };


  //**************************************************************************
  //** refresh
  //**************************************************************************
    refresh = () => {

        var me = this;
        var updateState = function(){
            console.log("refresh!");
            me.setState(state => ({
                hasNextPage: true,
                isNextPageLoading: false,
                numRequests: 0,
                items: []
            }));

            if (me.infiniteLoaderRef.current){
                me.infiniteLoaderRef.current.resetloadMoreItemsCache(true);
            }
        }

        var checkState = function(){
            if (me.state.isNextPageLoading){
                setTimeout(()=>{
                    checkState();
                }, 200);
            }
            else{
                updateState();
            }
        };

        if (this.state.numRequests>0){
            console.log(this.state.numRequests);
            checkState();
        }
    };


  //**************************************************************************
  //** render
  //**************************************************************************
    render() {
        const { hasNextPage, isNextPageLoading, items } = this.state;

        return (

            <Wrapper
              infiniteLoaderRef={this.infiniteLoaderRef}
              hasNextPage={hasNextPage}
              isNextPageLoading={isNextPageLoading}
              items={items}
              loadNextPage={this._loadNextPage}
              itemRenderer={this.props.itemRenderer}
              noItemsRenderer={this.props.noItemsRenderer}
              width={this.props.width}
              height={this.props.height}

            />

        );
    }
}


function Wrapper({

    // Are there more items to load?
    hasNextPage,

    // Are we currently loading a page of items?
    isNextPageLoading,

    // Array of items loaded so far.
    items,

    // Callback function responsible for loading the next page of items.
    loadNextPage,

    //Callback function used to render individual media items and folders.
    itemRenderer,

    noItemsRenderer,

    width,

    height,


    //Used to push the InfiniteLoader "up"
    infiniteLoaderRef

  }) {

    function getItemsForRow(rowIndex, maxItemsPerRow) {
        const result = [];
        const startIndex = rowIndex * maxItemsPerRow;
        for (let i = startIndex; i < Math.min(startIndex + maxItemsPerRow, items.length); i++) {
            result.push(items[i]);
        }
        return result;
    };


    function getMaxItemsPerRow() {
        return Math.max(Math.floor(width / ITEM_WIDTH), 1);
    };

    const oneItemPerRow = false;

    const rowCount = oneItemPerRow ? items.length : Math.ceil(items.length / getMaxItemsPerRow());
    //console.log("rowCount", rowCount);

    // If there are more items to be loaded then add an extra row to hold a loading indicator.
    const itemCount = hasNextPage ? rowCount + 1 : rowCount;
    //console.log("itemCount", itemCount);

    // Only load 1 page of items at a time.
    // Pass an empty callback to InfiniteLoader in case it asks us to load more than once.
    const loadMoreItems = isNextPageLoading ? () => {} : loadNextPage;
    //console.log("loadMoreItems", !isNextPageLoading);

    // Every row is loaded except for our loading indicator row.
    const isItemLoaded = index => !hasNextPage || index < rowCount;

    // Render an item or a loading indicator.
    const rowRenderer = ({ index, style }) => {

        //console.log("isItemLoaded(index)", index, isItemLoaded(index))

        if (!isItemLoaded(index)) {
            return <div style={style}>Loading...</div>;
        }
        else {

            if (oneItemPerRow) return <div style={style}>{itemRenderer(items[index])}</div>;

            const arr = getItemsForRow(index, getMaxItemsPerRow());

            return(
                <div style={style} >{
                    arr.map((item)=>{
                        return itemRenderer(item);
                    })
                }
                </div>
            )
        }

    };



    return (
      <InfiniteLoader
        itemCount={itemCount}
        ref={infiniteLoaderRef}
        isItemLoaded={isItemLoaded}
        loadMoreItems={loadMoreItems}
      >
        {({ onItemsRendered, ref }) => (
          <FixedSizeList
            className="List"
            ref={ref}
            width={width}
            height={height}
            itemCount={itemCount}
            itemSize={ITEM_HEIGHT}
            onItemsRendered={onItemsRendered}
            noItemsRenderer={noItemsRenderer}
          >
            {rowRenderer}
          </FixedSizeList>
        )}
      </InfiniteLoader>
    );
}