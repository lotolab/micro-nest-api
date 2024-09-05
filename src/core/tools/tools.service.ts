import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { customAlphabet } from 'nanoid/async';
import { objectKeySorted } from '../utils';

@Injectable()
export class ToolsService {
  private rounds: number;

  private readonly REQID_ALPHABET_SEED = '0123456789abcdefghijkmnpqrstuvwxyz._';
  private readonly CUSTOM_ALPHABET_SEED =
    '0123456789abcdefhikmnpqrstuvwxyzABCDEFHJKMNPQRSTUV';
  private readonly REQ_ALPHABET_SEED = '0123456789abcdefghijkmnpqrstuvwxyz';
  private readonly BASE58_ALPHABET_SEED =
    '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

  constructor(private readonly configService: ConfigService) {
    this.initRounds();
  }

  public get encrptRounds(): number {
    return this.rounds;
  }

  public async encrptPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(Number(this.encrptRounds));
    const enpw = await bcrypt.hash(password, salt);

    return enpw;
  }

  async genNanoid(size = 10) {
    const nanoid = customAlphabet(this.CUSTOM_ALPHABET_SEED, size);
    return await nanoid();
  }

  async createReqId(
    size: number = 20,
    prefix: string = 'tsmob',
  ): Promise<string> {
    const nanoid = customAlphabet(this.REQID_ALPHABET_SEED, size);

    const reqid = await nanoid();

    return prefix?.length ? `${prefix}@${reqid}` : reqid;
  }

  async createJti(size: number = 20) {
    const nanoid = customAlphabet(this.BASE58_ALPHABET_SEED, size);
    return await nanoid();
  }

  public async keccak256(
    uid: number,
    json?: Record<string, any>,
  ): Promise<string> {
    const salt = await bcrypt.genSalt(5);

    const merged: Record<string, any> = { ...(json ?? {}), uid };
    const sortedJson = objectKeySorted(merged);

    const text = `${uid}${JSON.stringify(sortedJson)}`;

    const hash = await bcrypt.hash(text, salt);

    return hash;
  }

  async validPassword(password: string, enpassword: string): Promise<boolean> {
    return await bcrypt.compare(password, enpassword);
  }

  private initRounds() {
    const r = this.configService.get<number>('jwt.encryptRounds', 11);
    this.rounds = r > 5 && r < 15 ? r : 11;
  }
}
