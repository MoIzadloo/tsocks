abstract class Obfs {
  public abstract name: string
  public abstract check(message: Buffer): boolean
  public abstract DeObfuscate(message: Buffer): Buffer
  public abstract obfuscate(message: Buffer): Buffer
}
export default Obfs
