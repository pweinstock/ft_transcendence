
interface MassageStyle {
	content: string;
	date: string;
	displayName: string;
	user: string;
}

const Message: React.FC<MassageStyle> = (props : MassageStyle) => {

return (
	<>
		<div className={ `message ${props.user !== props.displayName ? 'message-reverse' : ''}` }>
			<div className="datetime">
				<div className="datetime-date">{props.date}</div>
			</div>
			<div className="sender">
			<div className="sender-name d-none">{props.displayName}</div>
			</div>
			<div className="chattext">{props.content}</div>
		</div>
	</>
);
}

export default Message;