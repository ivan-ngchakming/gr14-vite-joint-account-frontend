import * as vuilder from '@vite/vuilder';
import config from "./local.config.json";

async function run(): Promise<void> {
  const provider = vuilder.newProvider(config.http);
  const deployer = vuilder.newAccount(config.mnemonic, 0, provider);

  console.log('deploying from', deployer.address)
  
  // compile
  const compiledContracts = await vuilder.compile('Cafe.solpp');
  // expect(compiledContracts).to.have.property('Cafe');

  // deploy
  let cafe = compiledContracts.Cafe;
  cafe.setDeployer(deployer).setProvider(provider);
  await cafe.deploy({});
  // expect(cafe.address).to.be.a('string');
  console.log(cafe.address);

  // call Cafe.buyCoffee(to, numOfCups);
  const block = await cafe.call(
    'buyCoffee',
    ['vite_ae5c625e30c55640724d1d2c54281e51651b8b8b889484ba70', 2],
    { amount: '2000000000000000000' }
  );

  // console.log(block);
  // const events = await cafe.getPastEvents('Buy', {
  //   fromHeight: block.height,
  //   toHeight: block.height,
  // });

  // console.log(events);
}


run().then(() => {
	console.log('done');
}).catch(err => console.error(err));
