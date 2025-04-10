# zkp/zkp_verifier.py

from zokrates_py import Zokrates

class ZKPVerifier:
    def __init__(self):
        self.zokrates = Zokrates()

    def verify_proof(self, proof, verification_key):
        """
        Verify the ZKP using the provided proof and verification key.
        
        :param proof: The proof generated by the prover.
        :param verification_key: The verification key generated during setup.
        :return: True if the proof is valid, False otherwise.
        """
        is_valid = self.zokrates.verify(verification_key, proof)
        return is_valid

# Example usage
if __name__ == "__main__":
    # Assuming proof and verification_key are obtained from the ZKPGenerator
    from zkp_generator import ZKPGenerator

    zkp_gen = ZKPGenerator()
    secret = 42  # Example secret
    proof, verification_key = zkp_gen.generate_proof(secret)

    verifier = ZKPVerifier()
    is_valid = verifier.verify_proof(proof, verification_key)
    print("Is the proof valid?", is_valid)
