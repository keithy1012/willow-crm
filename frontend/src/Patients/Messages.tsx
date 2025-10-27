import ProfileHeaderCard from "components/card/ProfileHeaderCard";
import Message from "components/messages/Message";

const Messages: React.FC = () => {
  return (
    <div className="w-full h-full bg-foreground">
      <div className="p-6">
        <ProfileHeaderCard
          name={"Lok Ye Young"}
          username={"lokyeyoung"}
          userId={"asdasdkfjalsjfd"}
        ></ProfileHeaderCard>
      </div>

      <Message
        sender={"Dr. Lok Ye Young"}
        content={
          "This is my message that I want to shareThis is my message that I want to shareThis is my message that I want to share"
        }
        timestamp={"3:15 PM"}
        receiving={true}
      ></Message>
      <Message
        sender={"Dr. Lok Ye Young"}
        content={
          "This is my message that I want to shareThis is my message that I want to shareThis is my message that I want to share"
        }
        timestamp={"3:15 PM"}
        receiving={false}
      ></Message>
    </div>
  );
};
export default Messages;
