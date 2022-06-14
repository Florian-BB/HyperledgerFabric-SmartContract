# HyperledgerFabric-SmartContract
Deployer automatiquement un SmartContrat avec le réseau de test

# Pour commencer, il faut préparer une VM sous linux (C'est une Debian 11 pour ma part).
# Il faut installer les paquets suivants :
# docker
apt-get install docker
# docker compose
apt-get install docker compose
# git
apt-get install git
# curl
apt-get install culr
# jq
apt-get install jq
# npm
npm install

# Créer un dossier à la racine nommé "fabric"
cd /fabric
# Installer la dernière version de test d'hyperledger
curl -sSL https://bit.ly/2ysbOFE | bash -s

# Copier ensuite le fichier start.sh dans /fabric/fabric-samples/test-network/
# Copier le fichier assetTransfer.js dans /fabric/fabric-samples/asset-transfer-basic/chaincode-javascript/lib/
# Copier le fichier assetTransfer.test.js dans /fabric/fabric-samples/asset-transfer-basic/chaincode-javascript//test/

# Depuis la session root (recommandé), se mettre sur le dossier "test-network" et lancer le script "start.sh" :
cd /fabric/fabric-samples/test-network/
./start.sh

# Lorsqu'il demande le label, copier coller celui qui est affiché juste au dessus
![image](https://user-images.githubusercontent.com/72450518/173684475-18ac8515-f8f5-4d25-ba2d-9b63a03b39cb.png)

# Une fois terminer, appliqué ces variables pour pouvoir intéragir avec la blockchain
# Ces variables permettent de lancer des commandes en tant que peerO de l'organisation 1

export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_ADDRESS=localhost:7051
export PATH=${PWD}/../bin:$PATH
export FABRIC_CFG_PATH=$PWD/../config/
export CC_PACKAGE_ID=basic_1.0:ce0b5b82ab8f1cac4d11d34fe2bbbd852cc21716dccc40b0abf2935aa9a97c72

# Lancer les commandes

# Afficher
peer chaincode query -C mychannel -n basic -c '{"Args":["GetAllAssets"]}'
# Reparer
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" -C mychannel -n basic --peerAddresses localhost:7051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" --peerAddresses localhost:9051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" -c '{"function":"RepairAsset","Args":["Car6"]}'
# Controler
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" -C mychannel -n basic --peerAddresses localhost:7051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" --peerAddresses localhost:9051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" -c '{"function":"ControlAsset","Args":["Car6"]}'

-----------------------------------------------------------------------------------------------------
# pour mettre à jour votre smartcontrat, Modifier le fichier "assetTransfer.js"
# Copier le fichier assetTransfer.js dans /fabric/fabric-samples/asset-transfer-basic/chaincode-javascript/lib/

# Arreter le réseau
./network.sh down

# relanser la création de la blockchain + le déploiement du smartcontrat
./start.sh

# Amusez vous dans l'écriture du SM.
