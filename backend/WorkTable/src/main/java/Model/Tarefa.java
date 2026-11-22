package Model;

import java.time.LocalDateTime;

public class Tarefa {

    private Long id;
    private String nome;
    private LocalDateTime date;
    private String notes;
    private Concluido concluido;
    private Long getIdUser;

    private static enum Concluido {
        TRUE, FALSE
    }

    private Tarefa(builderTarefa build) {
        this.id=build.id;
        this.nome = build.nome;
        this.notes = build.notes;
        this.concluido = Concluido.FALSE;
        this.date = LocalDateTime.now();
        this.getIdUser=build.getIdUser;
    }

    public String getNome() {
        return nome;
    }

    public LocalDateTime getDate() {
        return date;
    }

    public String getNotes() {
        return notes;
    }

    public Concluido getConcluido() {
        return concluido;
    }

    public Long getId() {return id;}

    public Long userId(){
        return this.id;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public void setId(Long id) {
        this.id = id;
    }

    @Override
    public String toString() {
        return "Tarefa{" +
                "nome='" + nome + '\'' +
                ", date=" + date +
                ", notes='" + notes + '\'' +
                ", concluido=" + concluido +
                '}';
    }

    public void alterarNome(String novoNome) {
        this.nome = novoNome;
    }

    public static class builderTarefa {

        private Long id;
        private String nome;
        private LocalDateTime date;
        private String notes;
        private Concluido concluido;
        private Long getIdUser;

        public builderTarefa IdUser(Long id){
            this.getIdUser=id;
            return this;
        }
        public builderTarefa Id(Long id){
            this.id=id;
            return this;
        }
        public builderTarefa notes(String notes){
            this.notes=notes;
            return this;
        }
        public builderTarefa nome(String nomes){
            this.nome=nomes;
            return this;
        }

        public Tarefa build() {
            return new Tarefa(this);
        }
    }
}
