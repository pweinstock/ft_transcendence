import { FormEventHandler, useState } from 'react';

export default function InputMessage() {
  const [message, setMessage] = useState('');

  async function handleOnClickSend(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    
    // await UpdateDatabase()
    //   .add({
    //     datetime: new Date(),
    //     sender: props.user.displayName,
    //     photoURL: props.user.photoURL,
    //     text: message
    //   });
    setMessage('');
  }

  return (
    <div className="input-group mb-3">
      <form onSubmit={handleOnClickSend}>
        <input
          type="text"
          id="input-message"
          name="input-message"
          placeholder="type..."
          className="form-control"
          value={message}
        />
        <div className="input-group-append">
          <button type="submit" className="btn btn-outline-primary">Send</button>
        </div>
      </form>
    </div>
  );
}