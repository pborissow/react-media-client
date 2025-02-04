import { useState, useEffect } from 'react';

//******************************************************************************
//**  Retriever
//******************************************************************************
/**
 *   React hook used to fetch media items and folders from the server.
 *
 ******************************************************************************/

function useFilter(filter) {
    const [result, setResult] = useState([]);
    const [loading, setLoading] = useState("false");
  
    useEffect(() => {
        async function fetchItems() {
            try {
                setLoading("true");


                var path = "";
                var params = {};
                for (var key in filter) {
                    if (filter.hasOwnProperty(key)){
        
                        if (key=="path"){
                            for (var i=0; i<filter.path.length; i++){
                                path += "/" + encodeURIComponent(filter.path[i]);
                            }
                        }
                        else{
                            params[key] = filter[key];
                        }
                    }
                }

                const response = await fetch('/index' + path, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(params)
                });
    
                const json = await response.json();
                setResult(json);

            } 
            catch (error) {
                setLoading("null");
            }
        }
  
        if (filter) {
            fetchItems();
        }
    }, [filter]);
  
    return [result, loading];
};

export default useFilter;