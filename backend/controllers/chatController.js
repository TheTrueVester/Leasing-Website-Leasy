import {Chat} from "../models/chatModel.js";
import {Message} from "../models/chatMessageModel.js";
import {User} from "../models/userModel.js";
import {uploadToS3} from "../middleware/fileUpload.js";

export const createChat = async (req, res, next) => {
  /*
     Creates a chat with the user-IDs of the two chat-participants
   */
  try {
    const {hostId, applicantId} = req.body;

    if (!hostId) {
      return res.status(400).json({message: "One party of the chat (the host) was not specified."});
    }
    if (!applicantId) {
      return res.status(400).json({message: "One party of the chat (the applicant) was not specified."});
    }
    if (hostId === applicantId) {
      return res.status(400).json({message: "The two participants of one chat can not be the same user."});
    }

    const host = await User.findById(hostId);
    if (!host) {
      return res.status(404).json({message: `A host with the ID "${hostId}" does not exist.`})
    }
    const applicant = await User.findById(applicantId);
    if (!applicant) {
      return res.status(404).json({message: `An applicant with the ID "${applicantId}" does not exist.`})
    }

    // Don't create a new chat if a chat between the same pair of users already exist
    const existingChat = await Chat.findOne({host: hostId, applicant: applicantId});
    if (existingChat) {
      return res.status(400).json({
        message: `A chat between these two users already exist.`,
      });
    }

    // No existing chat: Create new chat
    let chat = await Chat.create({host: hostId, applicant: applicantId});
    chat = await chat.populate(["host", "applicant", "messages"])
    res.status(201).json({
      message: "Chat created successfully",
      success: true,
      chat,
    });
    next();
  } catch (error) {
    console.error(error);
  }
};

export const getChatByChatId = async (req, res, next) => {
    /*
    Returns an chat object based on a specific chat-ID
     */
    try {
      const {chatId} = req.params;
      if (!chatId) {
        return res.status(400).json({message: "Specify a chat id."});
      }

      // Find chat by ID and populate some fields for display
      await Chat.findById(chatId)
        .populate("host", "email firstname lastname profilePicture")
        .populate("applicant", "email firstname lastname profilePicture")
        .populate("messages")
        .then((chat) => {
            if (!chat) {
              return res.status(404).json({
                message: `The chat with ID ${chat} does not exist`,
                success: false,
              });
            } else {
              return res.status(200).json({
                message: "The chat is retrieved successfully.",
                success: true,
                chat
              });
            }
          }
        ).catch((err) => {
          return res.status(500).json({
            message: err.message,
            success: false,
          })
        })
    } catch
      (error) {
      console.error(error);
    }
  }
;

export const getChatsByUserId = async (req, res, next) => {
  /*
  Retrieves all chats that the user with the specified user-ID is a participant in.
   */
  try {
    const {userId} = req.params;
    // does the specified user exist?
    if (!userId) {
      return res.status(400).json({message: "Specify a user whose chats should be retrieved."});
    }
    await User.findById(userId).then((user) => {
      if (!user) {
        return res.status(404).json({
          message: `The user with ID ${userId} does not exist`,
          success: false,
        });
      }
    }).catch((err) => {
      return res.status(500).json({
        message: err.message,
        success: false,
      })
    })

    // The specified user can be either the host or the applicant
    await Chat.find(
      {
        $or: [
          {host: userId},
          {applicant: userId}
        ]
      }
    )
      .populate("host", "email firstname lastname profilePicture")
      .populate("applicant", "email firstname lastname profilePicture")
      .populate("messages")
      .then((chats) => {
        if (chats.length !== 0) {
          return res.status(200).json({
            message: "Chats successfully retrieved.",
            success: true,
            chats: chats
          });
        } else {
          return res.status(200).json({
            message: "The specified user does not have any chats yet.",
            success: true,
            chats: []
          });
        }
      }).catch((err) => {
        return res.status(500).json({
          message: err.message,
          success: false,
        })
      });
  } catch (error) {
    console.error(error);
  }
};

export const deleteChat = async (req, res, next) => {
  /*
  Deletes a chat based on the chat-ID, only used for testing purposes
   */
  try {
    const {chatId} = req.params;

    if (!chatId) {
      return res.status(400).json({message: "Specify the ID of the chat to be deleted."});
    }

    await Chat.findById(chatId).then((chat) => {
      if (!chat) {
        return res.status(404).json({
          message: `There is no chat-instance with this ID.`,
        });
      }
    }).catch((err) => {
      return res.status(500).json({
        message: err.message,
        success: false,
      });
    });

    await Chat.findByIdAndDelete(chatId).then((result) => {
      return res.status(200).json({
        message: "Chat deleted successfully",
        success: true,
        result,
      });
    }).catch((err) => {
      return res.status(500).json({
        message: err.message,
        success: false,
      });
    });
  } catch (error) {
    console.error(error);
  }
};

export const createMessage = async (req, res, next) => {
  /*
  Creates a chat message object and inserts it in to the chat of the sender and recipient
   */
  try {
    const {senderId, recipientId, text} = JSON.parse(req.body.info);

    // Input validation
    if (!senderId) {
      return res.status(400).json({message: "The sender of the message was not specified."});
    }
    if (!recipientId) {
      return res.status(400).json({message: "The recipient of the message was not specified."});
    }
    if (senderId === recipientId) {
      return res.status(400).json({message: "The sender and the recipient of a message can not be the same."});
    }

    const sender = await User.findById(senderId);
    if (!sender) {
      return res.status(404).json({message: `The sender with the ID "${senderId}" does not exist.`})
    }
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({message: `The recipient with the ID "${recipientId}" does not exist.`})
    }

    // If the message contains a file -> upload to S3 and store the link
    let fileLink = "";
    if (req.file) {
      const file = req.file;
      if (file) {
        const data = await uploadToS3(file);
        if (data) {
          fileLink = data.Location;
        }
      }
    }

    // Create the message object
    const message = await Message.create(
      {sender: senderId, recipient: recipientId, text: text, file: fileLink}
    );

    // Find the chat between the host and recipient of the message, add the message to this chat
    const chat = await Chat.findOneAndUpdate(
      {
        $or: [
          {host: senderId, applicant: recipientId},
          {host: recipientId, applicant: senderId},
        ]
      }, {
        $push: {messages: message}
      }
    ).then((chat) => {
        res.status(201).json({
          message: "message created and appended",
          success: true,
          newMessage: message,
        });
      }
    ).catch((err) => {
      return res.status(500).json({
        message: err.message,
      });
    });

    if (!chat) {
      return res.status(404).json({
        message: `There is no chat instance between these two users yet.`,
      });
    }

    res.status(201).json({
      message: "Message created successfully",
      success: true,
      chat,
    });
  } catch (error) {
    console.error(error);
  }
};


