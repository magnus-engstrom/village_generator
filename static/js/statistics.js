const Statistics = (() => {
    sendToSerever = (sessionId, count, event) => {
      fetch('/stats?s='+sessionId+'&c='+count+'&e='+event);
    }
    return {
      send: (sessionId, count, event='generate from random') => {
        sendToSerever(sessionId, count, event);
      },
    }
  })();