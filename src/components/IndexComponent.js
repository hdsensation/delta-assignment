import React, { useEffect, useState } from 'react';
import './IndexComponent.css';
import axios from '../axios';

const WEB_SOCKET_URL = 'wss://production-esocket.delta.exchange';

// This is the main component
function IndexComponent() {
  const [currencies, setCurrencies] = useState([]);

  // Runs once per load (mounted)
  useEffect(() => {

    axios.get('/products')
    .then(res => {
      const currencies = res.data.result;

      // Set currency data in the state
      setCurrencies(currencies);

      // Create a websocket to server
      const ws = new WebSocket(WEB_SOCKET_URL);

      // Get a list of all symbols
      const allSymbols = []
      currencies.forEach(currency => {
        allSymbols.push(currency.symbol);
      })

      // Prepare the data to open socket connection
      const socketData = {
        "type": "subscribe",
        "payload": {
            "channels": [
                {
                    "name": "v2/ticker",
                    "symbols": allSymbols
                }
            ]
        } 
      };

      // On socket open send the data
      ws.onopen = () => {
        ws.send(JSON.stringify(socketData));
      };

      // When currency data is recieved put it in the right place
      ws.onmessage = function (event) {
        const json = JSON.parse(event.data);
        localStorage.setItem ('mark_price', [json.mark_price]);
        console.log(json.mark_price);
      };  

    }).catch(err => console.error(err))

  }, []); 

    return (

<div className="row" >
            <table className='table' >
                  <thead><tr className='table__align'>
                    <th className='table__head'>Symbol</th>  
                    <th className='table__head'>Description</th>
                    <th className='table__head'>Underlying Asset</th>
                    <th className='table__head'>Mark Price</th>
                  </tr> 
                  </thead>
                  <tbody>
                {currencies.map (currency =>(
                   <tr className='table__align' key={currency.id}>                               
                  <td className='table__data' key={currency.id}>
                  {currency.symbol} </td>
                  <td className='table__data' key={currency.id}>
                  {currency.description}</td>
                  <td className='table__data' key={currency.id}>
                  {currency.underlying_asset.symbol} </td>
                  <td className='table__data' key={currency.id}>
                  {localStorage.getItem('mark_price')}</td>                                   
                  </tr>       
              ))} </tbody>              
            </table>            
        </div>
    )
}

export default IndexComponent;