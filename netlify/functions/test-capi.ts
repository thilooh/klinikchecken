export const handler = async () => {
  const res = await fetch(
    `https://graph.facebook.com/v20.0/1600367881048155/events?access_token=EAAVjckHlfXkBReCnRoSuLaLdoZCzd1ERkuM5Y3bWSXeYjeCdW6mwWTOG1qHTCkfa0nYm8FJI0ASq2iqSKSBCK0n23aMxDZC8RZCZAsB6KrZATXLwiTuiO88pF0OFjttMAEd5ihXieynlGoe1lkK8vaySKvu3eoZCXZCZAIzlt7jfTMBme6WJFl1xTcmly0aFMQZDZD`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [{
          event_name: 'PageView',
          event_time: Math.floor(Date.now() / 1000),
          event_id: `test_${Date.now()}`,
          action_source: 'website',
          event_source_url: 'https://klinikchecken.de/',
          user_data: { client_ip_address: '127.0.0.1', client_user_agent: 'Mozilla/5.0 (test)' },
        }],
        test_event_code: 'TEST1076',
      }),
    }
  )
  const result = await res.json()
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify(result),
  }
}
