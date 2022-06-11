import { expect } from 'chai';
import * as vuilder from '@vite/vuilder';
import config from './local.config.json';

async function run(): Promise<void> {
	const provider = vuilder.newProvider(config.http);
	console.log(await provider.request('ledger_getSnapshotChainHeight'));
	const deployer = vuilder.newAccount(config.mnemonic, 0, provider);

	console.log('deploying from', deployer.address)
	
	// compile
	const compiledContracts = await vuilder.compile('JointAccounts.solpp');
	expect(compiledContracts).to.have.property('JointAccounts');

	// deploy
	let jointAccount = compiledContracts.JointAccounts;
	jointAccount.setDeployer(deployer).setProvider(provider);
	await jointAccount.deploy({});
	expect(jointAccount.address).to.be.a('string');
	console.log(jointAccount.address);

	return;
}

run().then(() => {
	console.log('done');
});
