// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VotacaoEstadual {
    struct Candidato {
        uint256 id;
        string nome;
        string partido;
        uint256 votos;
    }
    
    address public admin;
    mapping(uint256 => Candidato) public candidatos;
    mapping(address => bool) public eleitorRegistrado;
    mapping(address => bool) public jaVotou;
    mapping(address => uint256) public votosRealizados;
    
    uint256 public totalCandidatos;
    uint256 public totalVotos;
    bool public votacaoAtiva;
    
    modifier somenteAdmin() {
        require(msg.sender == admin, "Apenas admin pode executar");
        _;
    }
    
    modifier votacaoAberta() {
        require(votacaoAtiva, "Votacao nao esta ativa");
        _;
    }
    
    modifier eleitorValido() {
        require(eleitorRegistrado[msg.sender], "Eleitor nao registrado");
        require(!jaVotou[msg.sender], "Eleitor ja votou");
        _;
    }
    
    constructor() {
        admin = msg.sender;
        votacaoAtiva = false;
    }
    
    function registrarEleitor(address _eleitor) external somenteAdmin {
        eleitorRegistrado[_eleitor] = true;
    }
    
    function adicionarCandidato(string memory _nome, string memory _partido) external somenteAdmin {
        totalCandidatos++;
        candidatos[totalCandidatos] = Candidato({
            id: totalCandidatos,
            nome: _nome,
            partido: _partido,
            votos: 0
        });
    }
    
    function iniciarVotacao() external somenteAdmin {
        require(totalCandidatos > 0, "Nenhum candidato registrado");
        votacaoAtiva = true;
    }
    
    function encerrarVotacao() external somenteAdmin {
        votacaoAtiva = false;
    }
    
    function votar(uint256 _candidatoId) external votacaoAberta eleitorValido {
        require(_candidatoId > 0 && _candidatoId <= totalCandidatos, "Candidato invalido");
        
        candidatos[_candidatoId].votos++;
        jaVotou[msg.sender] = true;
        votosRealizados[msg.sender]++;
        totalVotos++;
    }
    
    function obterResultado(uint256 _candidatoId) external view returns (string memory nome, string memory partido, uint256 votos) {
        require(_candidatoId > 0 && _candidatoId <= totalCandidatos, "Candidato invalido");
        Candidato memory candidato = candidatos[_candidatoId];
        return (candidato.nome, candidato.partido, candidato.votos);
    }
    
    function verificarVotosEleitor(address _eleitor) external view returns (uint256) {
        return votosRealizados[_eleitor];
    }
    
    function obterTotalVotos() external view returns (uint256) {
        return totalVotos;
    }
}