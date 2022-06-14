import { constant } from '@vite/vitejs';
import { useFieldArray, useForm } from 'react-hook-form';
import { connect } from '../utils/globalContext';
import { State } from '../utils/types';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import cn from 'classnames';
import { useEffect } from 'react';
import JointAccountsContract from '../contracts/JointAccounts';

type Props = State & {};

const membersSchema = yup
	.array(
		yup.object({
			value: yup.string().length(55),
			id: yup.number(),
		})
	)
	.min(1)
	.required();
const schema = yup
	.object({
		approvalThreshold: yup
			.number()
			.min(1)
			.test('approvalThreshold', 'Invalid Threshold', function (value) {
				if (!value) {
					return false;
				}
				// @ts-ignore
				const members = this.options.parent.members;
				if (value > members.length) {
					return false;
				}
				return true;
			}),
		members: membersSchema,
	})
	.required();

const CreateAccount = ({ callContract, vcInstance }: Props) => {
	const { register, handleSubmit, formState, control } = useForm({
		resolver: yupResolver(schema),
	});
	const { errors } = formState;
	const { fields, append, remove } = useFieldArray({
		control,
		name: 'members',
	});
	
	const onSubmit = async (data: any) => {
		console.log(data);
		try {
			const res = await callContract(
				JointAccountsContract,
				'createAccount',
				[
					data.members.map((member: any) => member.value), // members
					data.approvalThreshold, // approvalThreshold
					0, // isStatic
					0, // isMemberOnlyDeposit
				],
				constant.Vite_TokenId,
				'0'
			);
			console.log(res);
		} catch (e) {
			console.error(e);
		}
	};

	useEffect(() => {
		// console.log(vcInstance?._accounts)
		if (vcInstance) {
			while (fields.length > 0) {
				remove(0);
			}
			for (let account of vcInstance._accounts) {
				append({ value: account });
			}
		}
	}, [vcInstance]);

	// console.log(fields, errors)

	return (
		<div>
			<h1>Create Account</h1>
			<form className={cn('flex', 'flex-col', 'items-start')} onSubmit={handleSubmit(onSubmit)}>
				{fields.map((field, index) => (
					<div className={cn('flex')}>
						<input
							className={cn(
								'form-control',
								'px-3',
								'py-1.5',
								'text-base',
								'font-normal',
								'text-gray-700',
								'bg-white bg-clip-padding',
								'border border-solid border-gray-300',
								'rounded',
								'transition',
								'ease-in-out',
								'm-0',
								'focus:text-gray-700',
								'focus:bg-white',
								'focus:border-blue-600',
								'focus:outline-none'
							)}
							key={field.id} // important to include key with field's id
							{...register(`members.${index}.value`)}
						/>
						<button className={cn('ml-4')} onClick={() => remove(index)}>
							-
						</button>
						{/* <p>{errors.members[index].message}</p> */}
					</div>
				))}
				<button onClick={() => append('')}>+</button>

				<input
					className={cn(
						'form-control',
						'px-3',
						'py-1.5',
						'text-base',
						'font-normal',
						'text-gray-700',
						'bg-white bg-clip-padding',
						'border border-solid border-gray-300',
						'rounded',
						'transition',
						'ease-in-out',
						'm-0',
						'focus:text-gray-700',
						'focus:bg-white',
						'focus:border-blue-600',
						'focus:outline-none'
					)}
					{...register('approvalThreshold', { required: true })}
				/>
				<p>{errors.approvalThreshold?.message}</p>

				<button type="submit">Submit</button>
			</form>
		</div>
	);
};

export default connect(CreateAccount);
