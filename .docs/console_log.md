 POST /api/rpc/base 200 in 2.4s (compile: 140ms, render: 2.3s)
Failed to fetch logs for celo: Error: Under the Free tier plan, you can make eth_getLogs requests with up to a 10 block range. Based on your parameters, this block range should work: [0x0, 0x9]. Upgrade to PAYG for expanded block range.
    at rpcCall (app\api\stats\global\route.ts:53:11)
    at async fetchEventLogs (app\api\stats\global\route.ts:70:19)
    at async fetchChainStats (app\api\stats\global\route.ts:134:39)
    at async GET (app\api\stats\global\route.ts:159:36)
  51 |   const data = await response.json();
  52 |   if (data.error) {
> 53 |     throw new Error(data.error.message || "RPC error");
     |           ^
  54 |   }
  55 |   return data.result;
  56 | }
 GET /api/stats/global 200 in 3.4s (compile: 954ms, render: 2.4s)
 POST /api/rpc/celo 200 in 1348ms (compile: 586ms, render: 762ms)