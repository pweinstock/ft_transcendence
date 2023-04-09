import { useEffect, useState } from 'react';
// import Message from './Message';
import './chatstart.css';


// interfaces user {
//   displayName: string;
// }

// interfaces message {
//   sender: string;
//   photoURL: string;
//   date: string;
//   time: string;
//   text: string;
// }


export default function MessageList() {
  const [messages, setMessages] = useState([]);
//   useEffect(() => {
//   getmassagedata() => {
//           const data = doc.data();
//           list.push({
//             id: doc.id,
//             datetime: new Date(data.datetime.seconds * 1000),
//             sender: data.sender,
//             photoURL: data.photoURL,
//             text: data.text
//           });
//         });
//         setMessages(list);
//       });
//   }, [ messages.length ]);

  return (
    <>
    </>
    // <div id="message-list">
    //   {messages.map((message) => {
    //     return (
    //       <div className={ `message ${user.displayName !== message.sender ? 'message-reverse' : ''}` }>
    //       <div className="datetime">
    //         <div className="datetime-date">{message.date}</div>
    //         <div className="datetime-time">{message.time}</div>
    //       </div>
    //       <div className="sender">
    //         <div className="sender-image">
    //           <img src={message.photoURL} alt={message.sender} title={message.sender} />
    //         </div>
    //         <div className="sender-name d-none">{message.sender}</div>
    //       </div>
    //       <div className="text">{message.text}</div>
    //     </div>
    //         // <Message key={message.id} message={message} user={props.user} />
    //     );
    //   })}
    // </div>
  );
}