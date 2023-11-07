import APIManager from "../utils/managers/APIManager";
import { RestEnds } from "./constants";

const joinUser = async (data) => APIManager.sendPost(RestEnds.JOIN, data);

const getUserRooms = async (userId) =>
  APIManager.sendGet(`${RestEnds.USER_ROOMS}?userId=${userId}`);

const getRoomsToJoin = async (userId) =>
  APIManager.sendGet(`${RestEnds.GET_ROOMS_TO_JOIN}?userId=${userId}`);

const createRoom = async (data) =>
  APIManager.sendPost(RestEnds.CREATE_ROOM, data);

const joinRoom = async (data) => APIManager.sendPost(RestEnds.JOIN_ROOM, data);

const getRoomMessages = async (roomId, userId) =>
  APIManager.sendGet(
    `${RestEnds.GET_ROOM_MESSAGES}?roomId=${roomId}&userId=${userId}`
  );

export const UserServices = {
  joinUser,
  getUserRooms,
  getRoomsToJoin,
  createRoom,
  joinRoom,
  getRoomMessages,
};
