export var generateRequestUrl = (function ()
{
    let api_address = process.env.REACT_APP_API_ADDRESS; 
    let api_version = process.env.REACT_APP_API_VERSION;

    return (api_route, params) => { 
        var url = [api_address, api_version, ...api_route].join("/");
        var params_text = "";
        if (params)
        {
            params_text = "?";

            for (let key in params)
            {
                params_text += key + "=" + params[key] + "&";
            }

            params_text = params_text.slice(0,-1); // remove last &
        }

        url += params_text; 
        return url;
     } 
})();

export var RequestMethodType = {
    GET: 'GET',
    POST: 'POST',
    DELETE: 'DELETE',
    PUT: 'PUT'
  };

/**
 * @param api_route array that concatenated constitutes final route 
 * @param request_params an object passed as options to fetch()
 */
export function getData(api_route, bake_parms_into_url, request_params, request_options) {
    const abortController = new AbortController();

    let url;
    let fetch_params;
    let headers;
    if(bake_parms_into_url)
    {
        url = generateRequestUrl(api_route, request_params);
        fetch_params = {};
        headers = {};
    }
    else{
        url = generateRequestUrl(api_route, {});
        fetch_params = { body: JSON.stringify(request_params) };
        headers = {
            headers:{
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        };
    }
    console.log(`in getData ${JSON.stringify(request_params)} url: ${url}`);
    let promise = fetch(
        url, 
        {
             signal: abortController.signal, 
            ...headers, 
            ...request_options, 
            ...fetch_params 
        }
    )
    .then((response) => {
        if(!response.ok || response.status != 200)
            throw new Error(`A fetch call failed: OK:${response.ok} STATUS:${response.status}`)

        return response.json();
    })
    .then((response_json) => {
        let return_value = {ok:true, body: response_json};
        return return_value;
    })
    .catch((error) => {
            console.log(error);
            return {ok:false, body:{}, error:error}});

    return [promise, 
        () => { 
            try {
                abortController.abort();
            } catch (error) {
                console.log(error);
            }
        } 
    ];
};

export async function handlePromise(promise, successCallback, failureCallback, message_prefix) {
    try{
      let response = await promise;

      console.log(`${message_prefix}:handlePromise: response ${JSON.stringify(response)}`);
      
      if (response.ok) {
        successCallback(response);
      }
      else
      {
        failureCallback(response);
      }
      return true;
    }
    catch(error){
      console.log(`${message_prefix}:handlePromise: error ${error}`);
      return false;
    }
  }