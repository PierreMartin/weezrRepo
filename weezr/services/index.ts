import axios from 'axios';
import { Platform } from "react-native";
import config from "../config";

const uri = config[Platform.OS].uri;

export const localClient = axios.create({ baseURL: `${uri}/api/` });
export const swapiClient = axios.create({ baseURL: 'https://swapi.co/api/' });
