// APS 1050 PROJECT
// D-VOTING
// YANGFAN LI
// 1003152982

import React, { Component } from "react";

import {
	Modal,
	MenuItem,
	TextField,
	Typography,
	Box,
	InputAdornment,
	Button,
	FormControl,
	FormControlLabel,
	FormLabel,
	RadioGroup,
	Radio,
	Chip
} from "@mui/material";
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import DatePicker from '@mui/lab/DatePicker';

import "./PostModal.css";

class PostModal extends Component {
	state = {
		name: "",
		body: "",
		optionInput: "",
		options: [],
		method: "evenly",
		strategy: "simple",

		minBalance: null,
		minBalanceError: null,
		firstTexDate: null
	};

	componentDidUpdate(prevProps) {
		if (!this.props.open && prevProps.open) {
			this.setState({
				name: "",
				body: "",
				optionInput: "",
				options: [],
				method: "evenly",
				strategy: "simple",
		
				minBalance: null,
				minBalanceError: null,
				firstTexDate: null
			});
		}
	}

	_timestampToBlockNumber = async (time) => {
		const timestamp = new Date(time).getTime() / 1000;

		// Binary search the closest block for timestamp
		let blockFound = false;
		const latestBlock = await this.props.web3.eth.getBlockNumber();
		let block = latestBlock;
		const closeRange = 600;
		while (true) {
			const blockTime = (await this.props.web3.eth.getBlock(block)).timestamp;
			const diff = timestamp - blockTime;
			blockFound = Math.abs(diff) < closeRange;

			if (blockFound) {
				return block;
			}

			if (diff < 0) {
				block = Math.round(block / 2);
			} else {
				block = parseInt(block * 1.5) + 1;
			}

			// Special handling for dev env
			if (block === 1) {
				return block;
			}

			if (block > latestBlock) {
				return  latestBlock;
			}
		}
	}

	_disableSubmit = () => {
		return (
			!this.state.name || !this.state.options.length || (
				this.state.strategy === "min-balance" && (!this.state.minBalance || this.state.minBalanceError)
			) || (
				this.state.strategy === "tex-time" && !this.state.firstTexDate
			)
		)
	};

	render() {
		const voteOptions = [
			{
			  value: "simple",
			  label: "simple",
			},
			{
			  value: "min-balance",
			  label: "Minimum Balance",
			},
			{
			  value: "tex-time",
			  label: "First Transaction",
			}
		];

		const helperText = {
			"simple": "Everyone can make a vote as long as they are not voted.",
			"min-balance": "Only accounts hold more than minimal balance can vote.",
			"tex-time": "Only accounts made transaction before certain time can vote"
		};

		return (
			<Modal
				open={this.props.open}
				onClose={this.props.close}
				aria-labelledby="modal-modal-title"
				aria-describedby="modal-modal-description"
			>
				<Box sx={{
					position: "absolute",
					top: "50%",
					left: "50%",
					transform: "translate(-50%, -50%)",
					width: 800,
					bgcolor: "background.paper",
					border: "2px solid #000",
					boxShadow: 24,
					p: 4,
					}}
				>
					<Typography id="modal-modal-title" variant="h6" component="h2">
						Create A New Voting Post
					</Typography>
					<Typography id="modal-modal-description" sx={{ mt: 2 }}>
						<FormLabel
							component="legend"
							sx={{
								marginTop: 2
							}}
						>
							Voting Information
						</FormLabel>
						<TextField
							required
							fullWidth
							id="post-title"
							label="Title"
							variant="outlined"
							margin="normal"
							value={this.state.name}
							onChange={(evt) => this.setState({ name: evt.target.value })}
						/>
						<TextField
							fullWidth
							multiline
							rows={5}
							id="post-body"
							label="Description"
							variant="outlined"
							margin="normal"
							value={this.state.body}
							onChange={(evt) => this.setState({ body: evt.target.value })}
						/>
						<Typography sx={{ display: "flex" }}>
							<TextField
								fullWidth
								multiline
								id="post-options"
								label="Options"
								variant="outlined"
								margin="normal"
								value={this.state.optionInput}
								onChange={(evt) => this.setState({ optionInput: evt.target.value })}
							/>
							<Button
								disabled={!this.state.optionInput || this.state.options.length > 2}
								onClick={() => {
									this.setState({
										optionInput: "",
										options: [...this.state.options, this.state.optionInput]
									});
								}}
							>
								Add
							</Button>
						</Typography>
						<Typography sx={{ display: "flex" }}>
							{this.state.options.map((option) => <Chip label={option} />)}
						</Typography>
						<FormLabel
							component="legend"
							sx={{
								marginTop: 2
							}}
						>
							Voting Strategy
						</FormLabel>
						<TextField
							select
							id="select-strategy"
							label="Select Voting Requirnment"
							margin="normal"
							value={this.state.strategy}
							onChange={(evt) => this.setState({ strategy: evt.target.value })}
							helperText={helperText[this.state.strategy]}
						>
							{voteOptions.map((option) => (
								<MenuItem key={option.value} value={option.value}>
									{option.label}
								</MenuItem>
							))}
						</TextField>
						{this.state.strategy === "min-balance" && (
							<TextField
								id="post-min-balance"
								label="Minimum Balance"
								variant="outlined"
								margin="normal"
								sx={{
									marginLeft: 2
								}}
								value={this.state.minBalance}
								onChange={(evt) => {
									const regex = /^[+-]?\d+(\.\d+)?$/;
									this.setState({
										minBalance: evt.target.value,
										minBalanceError: evt.target.value && !regex.test(evt.target.value)
									});
								}}
								error={this.state.minBalanceError}
								InputProps={{
									endAdornment: <InputAdornment position="end">ETH</InputAdornment>,
								}}
							/>
						)}
						{this.state.strategy === "tex-time" && (
							<LocalizationProvider dateAdapter={AdapterDateFns}>
								<DatePicker
									id="post-tex-time"
									label="Active Before"
									variant="outlined"
									value={this.state.firstTexDate}
									onChange={(newValue) => {
										this._timestampToBlockNumber(newValue);
										this.setState({ firstTexDate: newValue })}}
									renderInput={(params) => <TextField
										{...params}
										margin="normal"
										sx={{
											marginLeft: 2
										}}
									/>}
								/>
							</LocalizationProvider>
						)}
					</Typography>
					<FormControl component="fieldset">
						<RadioGroup
							aria-label="weight"
							name="row-radio-buttons-group"
							value={this.state.method}
							onChange={(evt) => this.setState({ method: evt.target.value })}
						>
							<FormControlLabel
								value="evenly"
								label="Evenly (One ticket per wallet address)"
								control={<Radio />} 
							/>
							<FormControlLabel
								value="balance"
								label="Balance (Weighted by wallet balance, more ether more power)"
								control={<Radio />} 
							/>
						</RadioGroup>
					</FormControl>
					<Typography
						sx={{ display: "flex", justifyContent: "flex-end" }}
						id="modal-footer"
						variant="h6"
						component="h2"
					>
						<Button variant="text" onClick={this.props.close}>
							Cancel
						</Button>
						<Button
							sx={{ m: 1 }}
							variant="text"
							onClick={async () => {
								const value = {
									name: this.state.name,
									body: this.state.body,
									method: this.state.method,
									strategy: this.state.strategy,
									minBalance: this.state.minBalance,
									firstTexDate: this.state.firstTexDate && await this._timestampToBlockNumber(this.state.firstTexDate),
									options: this.state.options
								};
								this.props.submit(value);
							}}
							disabled={this._disableSubmit()}
						>
							Create
						</Button>
					</Typography>
				</Box>
			</Modal>
		);
	}
}

export default PostModal;
