const searchBar = document.querySelector('input');
const list = document.querySelector('.list');

const items = [
{
			name: 'Ball',
			amount: 3,
			cost: 12000,
},
{
			name: 'car',
			amount: 2,
			cost: 450000,
},
{
			name: 'Hoodie',
			amount: 7,
			cost: 7000,
},
{
			name: 'Phone',
			amount: 5,
			cost: 30000,
},
{
			name: 'Basket',
			amount: 10,
			cost: 100000
}
];
const names = ['Meat','Food','Fish','Bike','Crisps','Sweet','Eggs','Soda','pork','Tv','Cups','Plate','Radio'];
for(let i=0; i<names.length; i++){
			items.push({name: names[i],amount: Math.floor(Math.random() * 20) + 1,cost: Math.floor(Math.random() * 1000000) + 1000});
}
for(let i=0; i<items.length; i++){
			const tr = document.createElement('tr');
			const td1 = document.createElement('td');
			const td2 = document.createElement('td');
			const td3 = document.createElement('td');
			
			td1.innerHTML = `${items[i].name}`;
			td2.innerHTML = `${items[i].amount}`;
			td3.innerHTML = `shs.${items[i].cost.toLocaleString()}`;
			tr.appendChild(td1);
			tr.appendChild(td2);
			tr.appendChild(td3);
			list.appendChild(tr);
}
searchBar.addEventListener('input',(e)=>{
			const value = e.target.value;
			const found = items.filter(it => it.name.toLowerCase().includes(value.toLowerCase()));
			found.forEach(it => console.log(it.name,it.amount,it.cost));
			list.innerHTML = '';
			const th = document.createElement('tr');
			const tn1 = document.createElement('td');
			const tn2 = document.createElement('td');
			const tn3 = document.createElement('td');
			tn1.innerHTML = 'Name';
			tn2.innerHTML = 'Amount';
			tn3.innerHTML = 'Cost';
			th.appendChild(tn1);
			th.appendChild(tn2);
			th.appendChild(tn3);
			list.appendChild(th);

			found.forEach(it => {
						const tr = document.createElement('tr');
			const td1 = document.createElement('td');
			const td2 = document.createElement('td');
			const td3 = document.createElement('td');
			
			td1.innerHTML = `${it.name}`;
			td2.innerHTML = `${it.amount}`;
			td3.innerHTML = `shs.${it.cost.toLocaleString()}`;
			tr.appendChild(td1);
			tr.appendChild(td2);
			tr.appendChild(td3);
			list.appendChild(tr);
			});
});
