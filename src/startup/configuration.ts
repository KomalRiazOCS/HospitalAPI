import config from 'config';

export default function configureApp(): void {
    const token: string | undefined = config.get('jwtprivatekey');
    if (!token) {
        console.log('Secret key is not defined');
        process.exit(1);
    }
}
